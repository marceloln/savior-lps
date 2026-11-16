// O texto completo das skills de base. É o arquivo pesado do lab: o Worker importa direto, a tela só carrega quando precisa.
import conteudos from './conteudos.json';
import type { Conteudos } from './skills';

export const CONTEUDOS = conteudos as Conteudos;
