import cron from 'node-cron';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { prismaClient } from '../prisma/index.js';

export const campaignWorker: FastifyPluginAsync = async (server) => {
  // run ever 1 minute
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running campaign worker');
    await updateCampaignIsActive();
  });

  const updateCampaignIsActive = async () => {
    const campaign = await prismaClient.merchantCampaign.findMany({})

    const nowDate = new Date()
    for(let i = 0; i < campaign.length; i++) {
      if(campaign[i].startPeriod <= nowDate && campaign[i].endPeriod > nowDate) {
        await prismaClient.merchantCampaign.update({
          where: {
            id: campaign[i].id
          },
          data: {
            isActive: true
          }
        })
      } else {
        await prismaClient.merchantCampaign.update({
          where: {
            id: campaign[i].id
          },
          data: {
            isActive: false
          }
        })
      }
    }
  }
};
