import { Card, CardContent, CardProps } from '@mui/material';

const GlassCard = ({ children, ...rest }: CardProps) => (
  <Card
    {...rest}
    sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.68)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.35)',
      boxShadow: '0 20px 40px rgba(103, 80, 164, 0.18)',
      ...rest.sx,
    }}
  >
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>{children}</CardContent>
  </Card>
);

export default GlassCard;
