setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cp ~ cp").lpf(2500).gain(.4)

$: s("hh*8").gain(.2).pan(.4)

$: n("0 3 7 5").scale("e:minor").s("gm_electric_guitar_clean")
  .lpf(2000).release(.2).room(.5).gain(.4)

$: n("<e2 e2 b1 c2>").scale("e:minor").s("gm_acoustic_guitar_steel")
  .lpf(700).release(.2).gain(.5)
