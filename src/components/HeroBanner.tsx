import bannerImg from '../assets/Banner-IMMA.png'

export function HeroBanner() {
  return (
    <section className="w-full overflow-hidden rounded-2xl shadow-sm">
      <img
        src={bannerImg}
        alt="Banner Promocional IMMA Atacadista"
        className="w-full h-auto object-cover rounded-2xl"
      />
    </section>
  )
}