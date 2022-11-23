import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import axios from 'axios';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';

export async function authRoutes(fastify: FastifyInstance){
  fastify.get('/me', 
  {
    onRequest: [authenticate]
  },
  async (request) => {
    return { user: request.user}
  })

  fastify.post('/users', async (request) => {
    try {
      const createUserBody = z.object({
        access_token: z.string()
      })
  
      const {access_token} = createUserBody.parse(request.body)
  

      const userResponse = await axios('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers:{
          Authorization: `Bearer ${access_token}`
        }
      })

      const userInfoSchema = z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        picture: z.string().url()
      })

      const userInfo = userInfoSchema.parse(userResponse.data)
      
      let user = await prisma.user.findUnique({
        where:{
          email: userInfo.email
        }
      })

      if(!user) {
        user = await prisma.user.create({
          data:{
            email: userInfo.email,
            googleId: userInfo.id,
            name: userInfo.name,
            avatarUrl: userInfo.picture,
          }
        })
      }
      const token = fastify.jwt.sign({
        name: user.name,
        avatarUrl: user.avatarUrl,
        email: user.email
      }, {
        sub:user.id,
        expiresIn: '1 day'
      })
  
      return { token}
    } catch (error) {
      console.log('ERROR =>', error)
    }
   
  })

  fastify.post('/refresh', async (request) => {
    return {message: 'refresh'}
  })
}
