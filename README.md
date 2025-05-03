# Formly - Modern Form Builder

Formly is a modern, user-friendly form builder application that allows you to create, manage, and analyze forms with ease. Built with Next.js 15, TypeScript, and TailwindCSS, it provides a seamless experience for both form creators and respondents.

## ✨ Features

- 🎨 **Intuitive Form Builder**

  - Drag-and-drop question reordering
  - Multiple question types (text, multiple choice, checkbox, dropdown)
  - Real-time preview
  - Form validation

- 📊 **Response Management**

  - View responses in table format
  - Export responses to CSV
  - Visual analytics with charts
  - Response filtering and sorting

- ⚙️ **Form Settings**

  - Publish/unpublish forms
  - Copy form links
  - Delete forms
  - Form analytics

- 🔒 **User Management**
  - Email and password authentication
  - User profiles
  - Form ownership
  - Access control

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm
- Neon PostgreSQL database (free tier available)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zulfikawr/formly.git
   cd formly
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```env
   DATABASE_URL=your-neon-postgresql-connection-string
   JWT_SECRET=your-jwt-secret
   ```

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
formly/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── forms/             # Form pages
│   └── auth/              # Authentication pages
├── components/            # Reusable components
│   ├── forms/            # Form-related components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── prisma/              # Database schema
└── types/               # TypeScript types
```

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) - React framework
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS 3.4](https://tailwindcss.com/) - Styling
- [shadcn](http://ui.shadcn.com/) - UI Library
- [Prisma](https://www.prisma.io/) - Database ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Zod](https://zod.dev/) - Schema validation
- [Recharts](https://recharts.org/) - Charts and analytics
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) - Drag and drop
- [Lucide React](https://lucide.dev/) - Icons

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/zulfikawr/formly/issues) on GitHub.

---

<div align="center">
  Made with ❤️ by Zulfikar
</div>
