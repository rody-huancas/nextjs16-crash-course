import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { events } from "@/lib/constants";

const Home = () => {
  return (
    <section>
      <h1 className="text-center">
        El calendario de eventos para <br /> desarrolladores de habla hispana.
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, conferencias, todo en un solo lugar.
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Próximos Eventos</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event.title} className="list-none">
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Home;
