import networkGraphic from '../assets/network-graphic.svg'

export default function Hero() {
  return <section className="hero section" id="top"><div className="hero-copy"><h1>GROW DATA.<br />GROW VALUE.<br />GROW TOGETHER.</h1><p>NodeConnect is a decentralized data infrastructure powering the Web3 frontier with privacy, sustainability, and rewards.</p></div><img className="network-art" src={networkGraphic} alt="" aria-hidden="true" /></section>
}