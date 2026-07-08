setcpm(100/4)

$: s("amen ~ cp ~").lpf(2500).release(.4).room(.4).gain(.7)

$: s("sleighbells ~ ht ~").gain(.35)

$: note("d2*8 d#5@4 ~ a4").s("gm_oboe").clip(.9).vib(10).vibmod(.1).lpf(2035).room(.6).delay(.3).gain(.4)

$: note("d2 ~ a1 ~").s("sawtooth").lpf(600).release(.2).gain(.4)
