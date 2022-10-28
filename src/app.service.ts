import type { Browser, Page } from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectBrowser } from 'nest-puppeteer';

@Injectable()
export class AppService {
    constructor(private readonly httpService: HttpService, @InjectBrowser() private readonly browser: Browser) {}
    
    async getTalentTree(clazz: string, spec: string) {

        try {
            const URL = `https://www.wowhead.com/beta/talent-calc/${clazz}/${spec}`;
            const page = await this.browser.newPage()
            await page.goto(URL)
            
            let checkpoints: number[] = [];
            const data = await page.$eval('.dragonflight-talent-trees', (el: Element) => {
                return [...el.querySelectorAll('.dragonflight-talent-trees-tree')].map(el => {
                    const connections = [...el.querySelectorAll('.dragonflight-talent-tree-connection')];
                    checkpoints = [...el.querySelectorAll('.dragonflight-talent-tree-checkpoint')].map((el, i) => {
                        const match = el.getAttribute('style')?.match(/(?<=top: ).+?(?=0%;)/)?.[0];
                        return match ? parseInt(match) : 0;
                    })
                    return [...el.querySelectorAll('.dragonflight-talent-tree-talent')].map(el => {
                        
                        const spellId = el.getAttribute('href')?.match(/(?<=spell=).+?(?=\/)/)?.[0]
                        const cell = parseInt(el.getAttribute('data-cell') ?? '-1');
                        const row = parseInt(el.getAttribute('data-row') ?? '-1');
                        const col = parseInt(el.getAttribute('data-column') ?? '-1');
                        const type = parseInt(el.getAttribute('data-talent-type') ?? '-1');
                        return {
                            talent: el.getAttribute('href'), 
                            spellId: spellId ? parseInt(spellId) : -1,
                            points: el.nextElementSibling?.textContent?.length ? parseInt(el.nextElementSibling?.textContent?.split('/')[1]) : 0,
                            row,
                            col,
                            cell,
                            type,
                            icon: el.querySelector('.dragonflight-talent-tree-talent-inner-background')?.getAttribute('style')?.match(/(?<=background-image: url\(").+?(?=\"\),)/)?.[0],
                            connections: connections.filter(el => parseInt(el.getAttribute('data-from-cell') ?? '-1') === cell).map(el => {
                                return el.getAttribute('data-to-cell');
                            }),
                            nextTalents: connections.filter(el => parseInt(el.getAttribute('data-to-cell') ?? '-1') === cell).map(el => {
                                return el.getAttribute('data-from-cell');
                            }),
                            requiresMinPoints: row >= checkpoints[0] ? row >= checkpoints[1] ? 20: 8: 0,
                            checkpoints
                        }
                    })
                })
            });
            page.close();
            return {
                class: {
                    name: clazz,
                    talents: data[0],
                },
                spec: {
                    name: spec,
                    talents: data[1],
                }
                /* spec: spec,
                classTalentTree: data[0],
                specTalentTree: data[1], */
            }

        } catch (error) {
            console.error(error)
        }
    }
}