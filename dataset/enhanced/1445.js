setcpm(122/4)

$: s("bd*2 ~ ~").bank("RolandTR909").gain(.85)

$: s("oh*4").gain(.2).pan(.4)

$: n("7 5 3 0 3 5 7 ~").scale("d:minor:pentatonic").s("sawtooth")
  .lpf(2000).release(.2).room(.4).gain(.4)

$: note("a3 f4 a3 c4").sound("sawtooth")
  .lpf(600).release(.2).gain(.5)
