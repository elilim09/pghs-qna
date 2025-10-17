import { Card, CardContent, CardProps } from '@mui/material';

const GlassCard = ({ children, ...rest }: CardProps) => (
  <Card
    {...rest}
    sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
      borderRadius: 24,
      ...rest.sx,
    }}
  >
    <CardContent
      sx={{
        p: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {children}
    </CardContent>
  </Card>
);

export default GlassCard;
