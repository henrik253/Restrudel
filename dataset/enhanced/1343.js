setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cp ~ cp").gain(.35)

$: note("f6 d6 b5 ~ a5 f6 d6 b5").s("triangle")
  .lpf(4000).release(.15).delay(.4).gain(.3)

$: n("0 3 7 5").scale("b:minor").s("gm_choir_aahs")
  .lpf(2200).room(.5).release(.4).gain(.3)
