# POS Admin Dashboard

A comprehensive Point of Sale (POS) admin dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Login system with demo mode support
- **Dashboard Overview**: Real-time statistics, recent sales, and low stock alerts
- **Customer Management**: Add, edit, and delete customer records
- **Product Management**: Inventory tracking with stock level monitoring
- **Point of Sale**: Full cart functionality with payment processing
- **Sales History**: Complete transaction history with filtering and search

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Backend**: Supabase (optional, for production)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd POS
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Mode

For testing, use the "Try Demo Account" button on the login page, or log in with any email and password.

## Project Structure

```
app/
├── globals.css          # Global styles
├── layout.tsx           # Root layout
├── page.tsx             # Login page
└── dashboard/
    └── page.tsx         # Dashboard with tabs
components/
├── ui/                  # Reusable UI components
├── login-page.tsx       # Login page component
├── dashboard-layout.tsx # Dashboard sidebar/layout
├── dashboard-content.tsx # Dashboard overview
├── customers-content.tsx # Customer management
├── products-content.tsx # Product management
├── pos-content.tsx      # Point of sale interface
└── sales-history-content.tsx # Sales history
lib/
├── supabase.ts          # Supabase client
└── utils.ts             # Utility functions
```

## Supabase Setup (Optional)

For production use with real data:

1. Create a [Supabase](https://supabase.com) project
2. Set up the following tables:
   - `customers` - Customer records
   - `products` - Product inventory
   - `sales` - Transaction history
   - `sale_items` - Individual items per sale
3. Configure RLS policies as needed
4. Add your credentials to `.env.local`

## Customization

- Modify `tailwind.config.js` to change colors and styling
- Update `app/globals.css` for CSS variables
- Add or modify components in `components/` directory

## License

MIT