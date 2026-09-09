import React from "react"

import { CardCarousel } from "@/components/ui/card-carousel"

const CardCaroursalDemo = () => {
  const images = [
    { src: "https://cdn.21st.dev/assets/mirror/e6/e6dfc47e04fccf1b31f70fd8a3c9a6ad76b7a0bb9527d1db1f54e9fc2e30efcf.jpg", alt: "Portrait 1" },
    { src: "https://cdn.21st.dev/assets/mirror/b7/b76d4075aa598b267f2da5ce5bdfc46d683f09f69b098ae90d0536aa00116c14.jpg", alt: "Portrait 2" },
    { src: "https://cdn.21st.dev/assets/mirror/3e/3e6e37882c77efa94d333606a621817362e785cb03ec45f8b1f063da5731122d.jpg", alt: "Portrait 3" },
  ]

  return (
    <div className="w-full">
      <CardCarousel
        images={images}
        autoplayDelay={2000}
        showPagination={true}
        showNavigation={true}
      />
    </div>
  )
}

export default CardCaroursalDemo;
