# MentorMe

MentorMe is a platform which connects school students with college mentors for personalized career guidance through one-on-one mentorship, AI-based mentor matching, and real-time chat.

Live Link: https://mentorme-qs6s.onrender.com

## ✨ Features

*   **Requests**: School students can send connection requests to college students for further guidance and interaction.
*   **Real-time Chatting**: Connected students can chat to mentors in real time implemented via sockets.
*   **Session Schedular**: School students can schedule their one-on-one mentorship sessions with the mentors and the mentors can accept or reject them according to their schedule.
*   **Chatbot**: Chatbot integration using llama model to help students clear their queries.
*   **Interactive UI**: Supports different size devices due to interactive UI styled using Tailwind.
*   **Mentor Matchmaking**: Variety of filters a school student can choose from to find their perfect mentors.

## 🛠️ Tech Stack

*   **Framework**: [React.js](https://react.dev/) 
*   **Language**: [JavaScript](https://devdocs.io/javascript/), [Node.js](https://nodejs.org/en)
*   **Server**: [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/)
*   **Styling**: [Tailwind](https://tailwindcss.com/)
*   **Form Handling**: [React Hook Form](https://react-hook-form.com/)
*   **State Management**: React Context API

## 📂 Project Structure

The project follows a standard Next.js structure with some key directories:

```
dakshh0827-blogs/
├── frontend/                      # Frontend logic
|   ├── public/                    # Static files and data
|   ├── src/                       # Frontend source directory
|   |   ├── assets/                # Static file
|   |   ├── components/            # Reusable components of react
|   |   ├── constants/             # Constant components
|   |   ├── lib/                   # Configuration and utility files
|   |   ├── pages/                 # Pages of the site
|   |   ├── store/                 # API call logic stores
├── backend/                       # Backend logic
|   ├── src/                       # Backend source directory
|   |   ├── controllers/           # APIs 
|   |   ├── lib/                   # Configuration files
|   |   ├── middlewares/           # Middlewares for verification 
|   |   ├── models/                # Database models(MongoDB Atlas)
|   |   ├── routes/                # Routes definition 


```

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dakshh0827/MentorMe.git
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, fill in the required values in your `.env` file. You will need to add/update the following variables:

    ```env
      MONGODB_URI = ""

      PORT = 5001
      
      JWT_KEY = ""
      
      
      CLOUDINARY_CLOUD_NAME = ""
      CLOUDINARY_API_KEY = ""
      CLOUDINARY_API_SECRET = ""
      
      NODE_ENV = "development"
    ```

4.  **Run the development server in backend:**
    ```bash
    cd backend
    npm run dev
    # or
    yarn dev
    ```
5.  **Run the development server in frontend:**
    ```bash
    cd frontend
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:5001](http://localhost:5001) with your browser to see the result.





*Thankyou*
