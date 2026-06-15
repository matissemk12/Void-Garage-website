import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          background: '#0c0c0c',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '0 80px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '8px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '56px',
                      height: '56px',
                      background: '#fff',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#000',
                      fontFamily: 'sans-serif',
                    },
                    children: 'V',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '28px',
                      fontWeight: '400',
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'sans-serif',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    },
                    children: 'Void Garage Cleaning',
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '72px',
                fontWeight: '700',
                color: '#ffffff',
                fontFamily: 'sans-serif',
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                textAlign: 'center',
              },
              children: 'Garage Cleanout & Junk Removal',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '28px',
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'sans-serif',
                letterSpacing: '0.04em',
                marginTop: '8px',
              },
              children: 'San Antonio, TX  ·  Same-Week Availability',
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
