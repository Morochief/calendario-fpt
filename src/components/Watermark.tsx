export default function Watermark() {
    return (
        <div style={{
            position: 'fixed',
            top: '25%',
            left: '20%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            width: '60%',
            maxWidth: '500px',
            aspectRatio: '1/1',
            backgroundImage: "url('/logo_cop-removebg-preview.svg')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            opacity: 0.03,
            pointerEvents: 'none',
            zIndex: 0,
        }} aria-hidden="true" />
    );
}
