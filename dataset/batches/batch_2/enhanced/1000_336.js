setcpm(100/4)

$: s("bd ~ hh ~").gain(.7)

$: note("a2*8 ~ a2*8 a2*8").s("triangle").lpf("<9000@7 5000@5>/16").gain(.3)

$: note("e4 g#4 e4 ~").s("sine").lpf(3341).hpf(800).room(.4).gain(.4).release(.1)
