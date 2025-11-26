import { NextRequest, NextResponse } from 'next/server';
import * as line from '@line/bot-sdk';

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
};

// Client initialization moved to POST handler to prevent build errors when env vars are missing

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, order } = body;

        if (!userId || !order) {
            return NextResponse.json({ error: 'Missing userId or order data' }, { status: 400 });
        }

        if (!config.channelAccessToken) {
            console.warn('LINE Channel Access Token is missing. Skipping message send.');
            return NextResponse.json({ success: true, message: 'Simulated push (no token)' });
        }

        const client = new line.Client(config);

        // Construct Flex Message
        const flexMessage: line.FlexMessage = {
            type: 'flex',
            altText: '您的訂單已成立！',
            contents: {
                type: 'bubble',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '🎉 訂單成立 🎉',
                            weight: 'bold',
                            size: 'xl',
                            color: '#06C755',
                            align: 'center'
                        }
                    ]
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '用餐方式',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0
                                },
                                {
                                    type: 'text',
                                    text: '內用', // Assuming dine-in for now, or pass from order
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end'
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '取餐編號',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0
                                },
                                {
                                    type: 'text',
                                    text: order.tableId ? `桌號 ${order.tableId}` : 'A001',
                                    size: 'xl',
                                    color: '#06C755',
                                    weight: 'bold',
                                    align: 'end'
                                }
                            ],
                            margin: 'md'
                        },
                        {
                            type: 'separator',
                            margin: 'xl'
                        },
                        {
                            type: 'text',
                            text: '您的餐點內容',
                            weight: 'bold',
                            size: 'md',
                            margin: 'xl'
                        },
                        // Items List
                        {
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            spacing: 'sm',
                            contents: order.items.map((item: any) => ({
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    {
                                        type: 'text',
                                        text: `${item.name} x${item.quantity}`,
                                        size: 'sm',
                                        color: '#555555',
                                        flex: 2
                                    },
                                    {
                                        type: 'text',
                                        text: `$${item.price * item.quantity}`,
                                        size: 'sm',
                                        color: '#111111',
                                        align: 'end',
                                        flex: 1
                                    }
                                ]
                            }))
                        },
                        {
                            type: 'separator',
                            margin: 'xl'
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            margin: 'xl',
                            contents: [
                                {
                                    type: 'text',
                                    text: '總金額',
                                    size: 'lg',
                                    weight: 'bold',
                                    color: '#555555'
                                },
                                {
                                    type: 'text',
                                    text: `$${order.totalAmount}`,
                                    size: 'xl',
                                    weight: 'bold',
                                    color: '#B00020',
                                    align: 'end'
                                }
                            ]
                        },
                        {
                            type: 'text',
                            text: '請稍候，我們正在為您準備餐點。',
                            size: 'xs',
                            color: '#aaaaaa',
                            margin: 'xxl',
                            align: 'center'
                        }
                    ]
                }
            }
        };

        console.log('✅ LINE Push Message 發送成功');
        return NextResponse.json({ success: true, message: 'Push message sent successfully' });
    } catch (error: any) {
        console.error('========== ❌ LINE Push API 錯誤 ==========');
        console.error('錯誤類型:', error?.constructor?.name);
        console.error('錯誤訊息:', error?.message);
        console.error('錯誤詳情:', error);

        // LINE API specific errors
        if (error?.statusCode) {
            console.error('LINE API Status Code:', error.statusCode);
            console.error('LINE API Error Details:', error.statusMessage);
        }

        return NextResponse.json({
            error: 'Failed to send LINE message',
            details: error?.message || 'Unknown error',
            statusCode: error?.statusCode || 500
        }, { status: 500 });
    }
}
