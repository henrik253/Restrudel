setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("shaker*16").gain(.15)

$: s("~ ~ ~ cymbal").gain(.3)

$: note("c4 d4").transpose("<0 2 [3 1]>/8").scale("c:major").s("gm_oboe")
  .struct("<~@2 [x x] [x ~]>").room(.3).release(.3).gain(.35)

$: n("<c2 g1 a1 f1>").scale("c:major").s("gm_electric_bass_finger")
  .lpf(700).release(.25).gain(.5)
