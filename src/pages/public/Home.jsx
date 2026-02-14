/**
 * @fileoverview Home page component.
 * Introduces the platform, highlights benefits, and displays client testimonials.
 *
 * @module pages/public/Home
 */

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  useTheme,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import LucyImg from '../../assets/images/Lucy.png';
import CharlesImg from '../../assets/images/Charles.png';
import DanielImg from '../../assets/images/Daniel.png';

/**
 * Testimonials configuration.
 * Each testimonial includes a name, role, text, and image.
 */
const testimonials = [
  {
    name: 'Lucy P.',
    role: 'CTO at ByteFarm',
    text: 'Integrating chat, code review, and project management in one place transformed our team dynamics. We spend less time searching—and more time creating.',
    image: LucyImg,
  },
  {
    name: 'Charles M.',
    role: 'Backend Lead at NovaTech',
    text: 'The code assistant helped us deliver faster. We use it in every review to optimize our scripts.',
    image: CharlesImg,
  },
  {
    name: 'Daniel R.',
    role: 'Fullstack Developer',
    text: 'As a freelancer, this platform gave me structure without paying for five separate services.',
    image: DanielImg,
  },
];

/**
 * Home component.
 * Renders the landing page with platform introduction, benefits, call-to-action, and testimonials.
 *
 * @function Home
 * @returns {JSX.Element} Home page layout
 */
const Home = () => {
  const theme = useTheme();
  const textColor = theme.palette.text.primary;
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <Box>
      <Container maxWidth="md">
        {/* Conditional welcome message */}
        <Typography variant="h4" gutterBottom>
          {isAuthenticated
            ? `Welcome ${user.displayName || user.email}`
            : 'Welcome, please log in'}
        </Typography>

        {/* Landing page content */}
        <Typography variant="h3" gutterBottom>
          Collaboration and Project Management Platform for Developers
        </Typography>
        <Typography variant="h5" gutterBottom>
          codeuniverse
        </Typography>
        <Typography variant="subtitle1" fontStyle="italic" gutterBottom>
          “Your code. Your team. Your platform. Everything in sync.”
        </Typography>

        <Box my={4}>
          <Typography gutterBottom>
            “Tired of wasting time juggling tasks, code, and scattered messages?” Development teams often struggle with disorganization...
          </Typography>
          <Typography gutterBottom>
            “Your code reviews are late. Your remote team struggles to communicate. And every sprint ends with more confusion than progress.” These challenges cause errors, burnout, and missed deadlines...
          </Typography>
          <Typography gutterBottom>
            “Imagine a single platform where you can manage projects, review code, collaborate in real time, and get intelligent assistance to generate optimized code.”
          </Typography>
        </Box>

        <Box my={6}>
          <Typography variant="h6" gutterBottom>Platform Benefits:</Typography>
          <ul>
            <li>📌 Visual Kanban boards for agile task management</li>
            <li>🔍 Built-in collaborative code reviews</li>
            <li>🎥🧠 Real-time chat</li>
            <li>🤖 AI assistant to generate, debug, and optimize code</li>
            <li>✅ Everything in one place—no more switching between 10 tabs</li>
          </ul>
        </Box>

        <Box my={6}>
          <Typography variant="h6" gutterBottom>Join Us:</Typography>
          <Typography gutterBottom>
            👉 “Join the developers who’ve left behind chaotic multitasking. Create your free account today and take your workflow to the next level.”
          </Typography>
          <Button variant="contained" color="primary" href="/register">
            Create Your Account
          </Button>
        </Box>

        <Box my={6}>
          <Typography variant="h6" gutterBottom>❤️ Client Testimonials</Typography>
          {/* Grid container */}
          <Grid container spacing={4}>
            {testimonials.map(({ name, role, text, image }) => (
              <Grid key={name} item xs={12} md={4}>
                <Card elevation={3}>
                  <CardContent>
                    <CardMedia
                      component="img"
                      image={image}
                      alt={name}
                      sx={{
                        height: 200,
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5',
                        mb: 2,
                      }}
                    />
                    <Typography variant="body1" gutterBottom>
                      "{text}"
                    </Typography>
                    <Typography variant="subtitle2">{name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
