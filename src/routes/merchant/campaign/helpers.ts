import { CampaignPrisma } from "./handler"

export const getNftPointersFromCampaignRequirement = (requirements: CampaignPrisma['requirements']) => {
  const nftPointers:string[] = []

  for(let i = 0; i < requirements.length; i++) {
    const requirement = requirements[i]
    if(requirement.type === 'NFT') {
      const chain = requirement.nftCollection.chain

      let chainId = 0
      if(chain.toLowerCase() === 'ethereum') {
        chainId = 1
      }else if(chain.toLowerCase() === 'matic') {
        chainId = 137
      }

      const pointers = `NFT-${chainId}-${requirement.nftCollection.address}`
      nftPointers.push(pointers)
    }else if(requirement.type === 'OAT'){
      const pointers = `OAT-${requirement.galxeCampaignId}`
      nftPointers.push(pointers)
    }
  }

  return nftPointers
}