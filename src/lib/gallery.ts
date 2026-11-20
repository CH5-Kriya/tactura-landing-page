export interface GalleryPhoto {
  image: string;
  title: string;
  alt: string;
}

export interface GalleryEvent {
  id: string;
  title: string;
  defaultIndex: number;
  photos: GalleryPhoto[];
}

export const galleryEvents: GalleryEvent[] = [
  {
    id: "user-testing",
    title: "User testing",
    defaultIndex: 1,
    photos: [
      {
        image: "/gallery/user-testing-1.webp",
        title: "Trying Tactura on iPad",
        alt: "A participant using Tactura on an iPad during user testing.",
      },
      {
        image: "/gallery/user-testing-2.webp",
        title: "User testing session",
        alt: "Two views of participants meeting and discussing Tactura during user testing.",
      },
      {
        image: "/gallery/user-testing-3.webp",
        title: "Introducing Tactura",
        alt: "A presenter holding an iPad during a Tactura user testing session.",
      },
      {
        image: "/gallery/user-testing-4.webp",
        title: "Exploring the 3D preview",
        alt: "A participant exploring Tactura on an iPad at a table.",
      },
    ],
  },
  {
    id: "exhibition",
    title: "Exhibition",
    defaultIndex: 0,
    photos: [
      {
        image: "/gallery/exhibition-1.webp",
        title: "Viewing a printed relief",
        alt: "A visitor holding a printed floral relief beside the Tactura display.",
      },
      {
        image: "/gallery/exhibition-2.webp",
        title: "Tactura at the exhibition",
        alt: "Two people displaying Tactura on an iPad and holding a printed relief.",
      },
      {
        image: "/gallery/exhibition-3.webp",
        title: "Relief preview on display",
        alt: "A floral relief in Tactura's 3D preview on an exhibition screen.",
      },
      {
        image: "/gallery/exhibition-4.webp",
        title: "Browsing artwork",
        alt: "An iPad showing a collection of images at the Tactura exhibition.",
      },
    ],
  },
];
