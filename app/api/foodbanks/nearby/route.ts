import  foodbanks from '@/data/foodbanks.json';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest, res: NextResponse) {
    const {latitude, longitude} = await req.json();
    const localbanks = foodbanks.filter((bank) => {
        const distance = Math.sqrt(Math.pow(bank.latitude - latitude, 2) + Math.pow(bank.longitude - longitude, 2));
        return distance < 1e9;
    })
    return NextResponse.json(localbanks);
}