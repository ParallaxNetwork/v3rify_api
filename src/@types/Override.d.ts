import { FastifyRequest } from "fastify";



declare module 'fastify' {
  interface FastifyRequest {
    user: DecodedToken
  }
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}