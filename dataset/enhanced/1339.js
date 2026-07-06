setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").hpf(6000).gain(.15)

$: s("sd cp").gain(.3).release(.6).room(.5).hpf(2000).velocity(.7)

$: n("0 3 7 5").scale("a:minor").s("gm_oboe")
  .lpf(2600).release(.3).gain(.35)
