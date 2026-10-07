import video from '../assets/videos/WhatsApp Video 2026-10-06 at 2.57.48 AM123.mp4'

export default function LandingVideo() {
  return (
    <section className="landing-video section" aria-labelledby="nodeconnect-video-title">
      <div className="landing-video-header">
        <span className="landing-video-kicker">NodeConnect</span>
        <h2 id="nodeconnect-video-title">Network vision</h2>
      </div>
      <div className="landing-video-frame">
        <video
          className="landing-video-player"
          src={video}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          controls
          aria-label="NodeConnect landscape video presentation"
          title="NodeConnect landscape video presentation"
        />
      </div>
    </section>
  )
}
