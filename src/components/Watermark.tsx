export default function Watermark() {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '650px',
            height: '650px',
            backgroundImage: "url('/logo_cop-removebg-preview.svg')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 0,
        }} aria-hidden="true" />
    );
}
