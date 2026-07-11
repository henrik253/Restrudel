setcpm(100/4)

$: note("e1 ~").scale("c2:minor").gain(0.3)

$: s("rd*3 bd!2").slow(4).gain(0.4)

$: s("clavisynth 127").gain(0.5)

$: note("g5 e5").scale("c2:minor").sound("sine ~").lpf(2600).room(.6).delay(.2651).gain(.6097).release(.05)
