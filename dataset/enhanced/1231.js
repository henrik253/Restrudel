setcpm(122/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ bd ~ bd").bank("RolandTR909").gain("[.5 .25]*2")

$: s("shaker*16").gain(.18)

$: note("d2*8 g4 d#4 f4 d#4").s("square")
  .lpf(3000).resonance(5).room(.9).release(.15).gain(.35)

$: note("<d2 d2 g1 a#1>").s("sawtooth")
  .lpf(600).release(.2).gain(.4)
