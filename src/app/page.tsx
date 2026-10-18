import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SlideDeck from "@/components/SlideDeck";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: { xs: 1.5, sm: 2 } }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={1.5}>
          <Typography variant="h5" component="h1" fontWeight={700} sx={{ fontSize: { xs: "1.3rem", sm: "1.6rem" } }}>
            🔒 HTTPS のしくみ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            HTTP と何が違う？ 共通鍵と公開鍵を組み合わせた TLS のしくみを、自分で動かしながら確かめよう
          </Typography>
        </Box>
        <SlideDeck />
      </Container>
    </Box>
  );
}
