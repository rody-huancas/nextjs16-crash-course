import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({icon, alt, label}: { icon: string; alt: string; label: string }) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {
        agendaItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))
      }
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {
      tags.map((tag, index) => (
        <div key={index} className="pill">{tag}</div>
      ))
    }
  </div>
)

const EventDatailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const { event: { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } } = await request.json();

  if (!description) return notFound();

  const agendaItems = agenda && agenda.length > 0 ? agenda[0].split(',').map((item: string) => item.trim()) : [];

  const tagItems = tags && tags.length > 0 
    ? tags[0].replace(/"/g, '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
    : [];

  return (
    <section id="event">
      <div className="header">
        <h1>Descripción del evento</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Contenido del evento */}
        <div className="content">
          <Image src={image} alt="Banner del evento" width={800} height={800} className="banner" />

          <section className="flex-col gap-2">
            <h2 className="text-lg font-semibold">Información del evento</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col gap-2">
            <h2 className="text-lg font-semibold">Resumen del evento</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={agendaItems} />

          <section className="flex-col gap-2">
            <h2>Sobre el Organizador</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tagItems} />
        </div>

        {/* Formulario */}
        <aside className="booking">
          <p className="text-lg font-semibold">Formulario</p>
        </aside>
      </div>
    </section>
  )
}

export default EventDatailsPage