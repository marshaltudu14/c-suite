import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for chat previews
    // In a real app, this would fetch from a database based on the authenticated user
    const mockChatPreviews = {
      "sarah-chen": "Let's discuss the Q4 strategy and market expansion plans...",
      "michael-rodriguez": "The financial projections look promising for next quarter...",
      "david-kim": "I've reviewed the technical architecture and have some suggestions...",
      "emily-davis": "The marketing campaign performance exceeded our expectations...",
      "james-wilson": "Our client retention rates have improved significantly...",
      "lisa-thompson": "The team productivity metrics show positive trends...",
      "alex-johnson": "I need to review the project timeline and deliverables...",
      "maria-garcia": "The customer feedback has been overwhelmingly positive..."
    };

    return NextResponse.json({
      success: true,
      data: mockChatPreviews
    });
  } catch (error) {
    console.error('Error fetching last chats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chat previews'
      },
      { status: 500 }
    );
  }
}
