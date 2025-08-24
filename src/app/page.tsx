export default function Home() {
  return (
    <main className="">
      <section className="flex flex-col justify-center items-center relative overflow-hidden lg:h-[600px]">
        <video src="/videos/ive-video.mp4" autoPlay loop muted></video>
        <div className="absolute text-center text-white bg-[#00000096] w-full h-full flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo à Igreja Viva Esperança</h1>
          <p className="text-lg">Uma igreja bíblica, acolhedora e generosa</p>
        </div>
      </section>
      <section className="flex max-w-7xl mx-auto p-4 gap-4 ">
        QUEM SOMOS
      </section>
      <section className="flex max-w-7xl mx-auto p-4 gap-4 min-h-96 h-">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">Endereço</h2>
          <p>Avenida Nelson Cardoso, 299 - Taquara, Rio de Janeiro - RJ, 22730-900</p>
        </div>
        <div className="flex-1">
          <iframe className="w-full h-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12329.494732491006!2d-43.37237395735968!3d-22.9178069116136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bd966a38f8a59%3A0xdfecedf02605ce6f!2sIVE%20-%20Igreja%20Viva%20Esperan%C3%A7a!5e1!3m2!1spt-BR!2sbr!4v1755646414777!5m2!1spt-BR!2sbr" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>
      <section className="flex max-w-7xl mx-auto p-4 gap-4">
        blogaqiu
      </section>
    </main>
  );
}
