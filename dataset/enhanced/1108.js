setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2).release(.1)

$: note("d4 f4 a4").s("supersaw").lpf(700).lpq(8)
  .distort("1.5:.7").room(.44).delay(.5).delayfeedback(.42).gain(.35)

$: n("~ 2 11 9 10 8 13 12").scale("d:minor").s("sawtooth")
  .lpf(1200).release(.15).gain(.4)
