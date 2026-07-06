setcpm(116/4)

$: n("4 6 4 2 3 1 2 0 1 ~ 6 -1@3").scale("d:minor:pentatonic").velocity(.63).pan(.6)
  .s("supersaw").lpf(1800).release(.2).gain(.35)

$: s("bd ~ [sd cp] ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.18)

$: note("a4 c5 e5 c5").s("piano").slow(2).room(.5).gain(.25)

$: note("d2 ~ d2 ~ f2 ~ c2 ~").s("square").lpf(500).release(.15).gain(.45)
