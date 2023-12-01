import { AlchemyAssetsModel } from 'types/Alchemy.js';
import { alchemyGetOwnedNfts, alchemyGetOwnersOfNft } from '../../utils/alchemy/alcemyNft.js';
import { convertChainStringToId } from '../../utils/miscUtils.js';

export const summarizeNftAttributes = (nfts: InfuraAssetsModel[]): RarityModel => {
  const rarity: RarityModel = {
    attributes: [],
    total: 0,
  };

  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    const supply = parseInt(nft.supply);

    nft.metadata?.attributes?.forEach((attribute) => {
      const traitType = attribute.trait_type;
      const traitValue = attribute.value;

      // if traitType doesnt exist in rarity.attributes, add it
      let traitTypeIndex = rarity.attributes.findIndex((attribute) => attribute.trait_type === traitType);
      if (traitTypeIndex === -1) {
        rarity.attributes.push({
          trait_type: traitType,
          properties: [],
        });
        traitTypeIndex = rarity.attributes.findIndex((attribute) => attribute.trait_type === traitType);
      }

      // if traitValue doesnt exist in rarity.attributes[traitType].properties, add it
      const traitValueIndex = rarity.attributes[traitTypeIndex].properties.findIndex(
        (property) => property.name === traitValue,
      );
      if (traitValueIndex === -1) {
        rarity.attributes[traitTypeIndex].properties.push({
          name: traitValue,
          count: supply,
          uniqueOwners: [nft.owner.toLowerCase()],
        });
      } else {
        // if traitValue does exist in rarity.attributes[traitType].properties, increment count
        rarity.attributes[traitTypeIndex].properties[traitValueIndex].count += supply;
        // add owner to uniqueOwners, if not already there
        if (
          !rarity.attributes[traitTypeIndex].properties[traitValueIndex].uniqueOwners.includes(nft.owner.toLowerCase())
        ) {
          rarity.attributes[traitTypeIndex].properties[traitValueIndex].uniqueOwners.push(nft.owner.toLowerCase());
        }
      }
    });

    rarity.total += supply;
  }

  // sort rarity.attributes by attributes.properties[].count descending
  rarity.attributes.forEach((attribute) => {
    attribute.properties.sort((a, b) => b.count - a.count);
  });

  return rarity;
};

const convertOwnerNftToAsset = ({
  data,
  chainId,
}: {
  data: InfuraNftOwnersModel[];
  chainId: number;
}): InfuraAssetsModel[] => {
  return data.map((item) => ({
    contract: item.tokenAddress,
    tokenId: item.tokenId,
    supply: item.amount,
    type: item.contractType,
    metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata,
    chainId: chainId,
    owner: item.ownerOf,
  }));
};

export const generateOwnershipPointer = (params: OwnershipPointerParams): string => {
  if (params.type === 'NFT') {
    return `NFT-${params.chainId}-${params.address}`;
  } else if (params.type === 'OAT') {
    return `OAT-${params.campaignId}`;
  }
};

export const alchemyGetAllOwnedNfts = async (
  address: string,
  chainId: number,
  tokenAddresses?: string[],
): Promise<AlchemyAssetsModel[]> => {
  try {
    const nfts = [] as AlchemyAssetsModel[];
    let pageKey = undefined;

    do {
      const response = await alchemyGetOwnedNfts(chainId, address, pageKey, tokenAddresses);
      const { assets, pageKey: newPageKey } = response;

      nfts.push(...assets);
      pageKey = newPageKey;

      console.log(`Fetched ${nfts.length} nfts in total`);
    } while (pageKey !== undefined);

    // add chainId to each nft
    nfts.forEach((nft) => {
      nft.chainId = chainId;
      // adjust nft to fit InfuraAssetsModel
      nft.supply = nft.contract.totalSupply || null;
      nft.type = nft.tokenType;
      nft.metadata = nft.rawMetadata;
      (nft.contract as any) = nft.contract.address;
    });

    // filters out if nft.metadata is null
    let filteredNfts = nfts.filter(
      (nft) =>
        nft.contract &&
        nft.tokenId &&
        nft.tokenType &&
        nft.metadata &&
        nft.metadata.name &&
        nft.metadata.name &&
        nft.metadata.image,
    );

    if (chainId === 137) {
      filteredNfts = filteredNfts.filter((nft) => nft.tokenId.length <= 12);
    }

    return filteredNfts;
  } catch (error) {
    console.log(error);
  }
};

export const alchemyGetAllOwnersOfNft = async (address: string, chain: string): Promise<InfuraAssetsModel[]> => {
  try {
    // get owners
    const owners: string[] = [];
    let pageKey = null;
    do {
      const response = await alchemyGetOwnersOfNft(convertChainStringToId(chain), address, pageKey);
      const { owners: newOwners, pageKey: newPageKey } = response;

      owners.push(...newOwners);
      pageKey = newPageKey ?? null;

      console.log(`Fetched ${owners.length} owners in total`);
    } while (pageKey !== null);

    // get assets for each owner
    const ownersWithAsset: InfuraNftOwnersModel[] = [];
    let oi = 0;
    let pageKeyOi = null;
    do {
      const ownerAddr = owners[oi];
      const nftsForOwner = await alchemyGetOwnedNfts(convertChainStringToId(chain), address, pageKeyOi);
      const { assets, pageKey: newPageKeyOi, total } = nftsForOwner;

      assets.forEach((item) => {
        ownersWithAsset.push({
          tokenAddress: item.contract.address,
          tokenId: item.tokenId,
          amount: item.contract.totalSupply || null,
          contractType: item.contract.tokenType,
          ownerOf: ownerAddr,
          metadata: typeof item.rawMetadata === 'string' ? JSON.parse(item.rawMetadata) : item.rawMetadata,
          blockNumber: `${item.contract.deployedBlockNumber}`,
          blockNumberMinted: null,
          name: item.contract.name,
          symbol: item.contract.symbol,
          tokenHash: null,
        });
      });

      pageKeyOi = newPageKeyOi ?? null;
      oi++;

      console.log(`Fetched ${total} nfts for owner ${ownerAddr}`);
    } while (pageKeyOi !== null);

    const converted = convertOwnerNftToAsset({
      data: ownersWithAsset,
      chainId: convertChainStringToId(chain),
    });

    return converted;
  } catch (error) {
    console.log(error);
  }
};
