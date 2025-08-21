import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  const [currentPic, setPic] = useState(0);
  const pictures = [
    "/pictures/831577.png",
    "/pictures/giorno_giovanna__jojo__pt2_by_lukachighladze_dhcz4hf-fullview.jpg",
    "/pictures/jojos-bizarre-adventure-jotaro-kujo-colorful-desktop-wallpaper-preview.jpg",
    "/pictures/wp4353658-steel-ball-run-wallpapers.jpg",
    "/pictures/wp12447530-jojo-bizarre-adventure-computer-4k-wallpapers.jpg",
  ];

  const handleClick = () => {
    setCount(count + 1);

    // nächstes Bild, wieder auf 0 wenn am Ende
    setPic((prevPic) => (prevPic + 1) % pictures.length);
  };
  return (
    <div>
      <p>Pressed the button {count} times</p>
      <button onClick={handleClick}>CLICK ME</button>
      <img
        style={{ maxWidth: "25%" }}
        src={pictures[currentPic]}
        alt="Nothing sowwy"
      />
    </div>
  );
}
