import { infuraGetNftsFromCollection, infuraGetOwnedNfts } from '../../utils/infura/infuraNft.js';
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

export const summarizeNftAttributes = (nfts: InfuraAssetsModel[]):RarityModel => {
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
        });
      } else {
        // if traitValue does exist in rarity.attributes[traitType].properties, increment count
        rarity.attributes[traitTypeIndex].properties[traitValueIndex].count += supply;
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


export const infuraGetAllOwnedNfts = async (address: string, chainId: number): Promise<InfuraAssetsModel[]> => {
  try {
    const nfts = [] as InfuraAssetsModel[];
    let cursor = null;

    do {
      const response = await infuraGetOwnedNfts(chainId, address, cursor)
      const { assets, cursor: newCursor } = response;

      nfts.push(...assets);
      cursor = newCursor;

      console.log(`Fetched ${nfts.length} nfts in total`);
    } while (cursor !== null);

    // add chainId to each nft
    nfts.forEach((nft) => {
      nft.chainId = chainId;
      console.log("METADATA", nft.metadata)
    });

    // filters out if nft.metadata is null
    const filteredNfts = nfts.filter((nft) => nft.metadata !== null);

    return filteredNfts;
  } catch (error) {
    console.log(error);
  }
}