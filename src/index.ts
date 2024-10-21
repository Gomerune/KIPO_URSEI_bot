import dotenv from 'dotenv';
import Bot from './main/VkBot';

dotenv.config()

new Bot(process.env.TOKEN, process.env.GROUP_ID).init();