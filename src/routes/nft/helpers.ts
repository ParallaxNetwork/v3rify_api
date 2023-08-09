import { infuraGetNftsFromCollection, infuraGetOwnedNfts, infuraGetOwnersOfNft } from '../../utils/infura/infuraNft.js';
import { convertChainStringToId } from '../../utils/miscUtils.js';

export const infuraGetAllNfts = async (address: string, chain: string): Promise<InfuraAssetsModel[]> => {
  try {
    const nfts = [];
    let cursor = null;

    do {
      const response = await infuraGetNftsFromCollection(convertChainStringToId(chain), address, cursor);

      const { assets, cursor: newCursor } = response;

      nfts.push(...assets);
      cursor = newCursor;

      console.log(`Fetched ${nfts.length} nfts in total`);
    } while (cursor !== null);

    return nfts;
  } catch (error) {
    console.log(error);
  }
};

export const summarizeNftAttributes = (nfts: InfuraAssetsModel[]): RarityModel => {
  const rarity: RarityModel = {
    attributes: [],
    total: 0,
  };

  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    const supply = parseInt(nft.supply);

    nft.metadata?.attributes.forEach((attribute) => {
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
          uniqueOwners: [nft.owner.toLowerCase()]
        });
      } else {
        // if traitValue does exist in rarity.attributes[traitType].properties, increment count
        rarity.attributes[traitTypeIndex].properties[traitValueIndex].count += supply;
        // add owner to uniqueOwners, if not already there
        if (!rarity.attributes[traitTypeIndex].properties[traitValueIndex].uniqueOwners.includes(nft.owner.toLowerCase())) {
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

export const infuraGetAllOwnedNfts = async (
  address: string,
  chainId: number,
  tokenAddresses?: string[],
): Promise<InfuraAssetsModel[]> => {
  try {
    const nfts = [] as InfuraAssetsModel[];
    let cursor = null;

    do {
      const response = await infuraGetOwnedNfts(chainId, address, cursor, tokenAddresses);
      const { assets, cursor: newCursor } = response;

      nfts.push(...assets);
      cursor = newCursor;

      console.log(`Fetched ${nfts.length} nfts in total`);
    } while (cursor !== null);

    // add chainId to each nft
    nfts.forEach((nft) => {
      nft.chainId = chainId;
    });

    // filters out if nft.metadata is null
    let filteredNfts = nfts.filter(
      (nft) =>
        nft.contract &&
        nft.tokenId &&
        nft.type &&
        nft.metadata &&
        nft.metadata.name &&
        nft.metadata.name &&
        nft.metadata.image,
    );

    // filter, if chainId is 137 (Polygon), and tokenId is too long (more than 12 digits), then remove
    if (chainId === 137) {
      filteredNfts = filteredNfts.filter((nft) => nft.tokenId.length <= 12);
    }

    // console.log("FILTERED NFTS: ", filteredNfts);

    return filteredNfts;
  } catch (error) {
    console.log(error);
  }
};

const convertOwnerNftToAsset = ({
  data,
  chainId,
}: {
  data: InfuraNftOwnersModel[];
  chainId: number;
}): InfuraAssetsModel[] => {
  return data.map(item => ({
    contract: item.tokenAddress,
    tokenId: item.tokenId,
    supply: item.amount,
    type: item.contractType,
    metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata,
    chainId: chainId,
    owner: item.ownerOf
  }));
};

export const infuraGetAllOwnersOfNft = async (address: string, chain: string): Promise<InfuraAssetsModel[]> => {
  try {
    const owners: InfuraNftOwnersModel[] = [];
    let cursor = null;

    do {
      const response = await infuraGetOwnersOfNft(convertChainStringToId(chain), address, cursor);

      const { owners: newOwners, cursor: newCursor } = response;

      owners.push(...newOwners);
      cursor = newCursor;

      console.log(`Fetched ${owners.length} owners in total`);
    } while (cursor !== null);

    // make owners.metadata JSON.parse
    owners.forEach((owner) => {
      owner.metadata = JSON.parse(owner.metadata as string);
    });

    const converted = convertOwnerNftToAsset({
      data: owners,
      chainId: convertChainStringToId(chain),
    })
    
    return converted;
  } catch (error) {
    console.log(error);
  }
};

export const generateOwnershipPointer = (params: OwnershipPointerParams): string => {
  if (params.type === 'NFT') {
    return `NFT-${params.chainId}-${params.address}`;
  } else if (params.type === 'OAT') {
    return `OAT-${params.campaignId}`;
  }
};
