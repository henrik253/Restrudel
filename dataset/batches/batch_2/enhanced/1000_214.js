setcpm(112/4)

$: s("hh!4 sd@3 ~ cp*4").bank("RolandMT32").gain(.4).speed(1).hpf(1500)

$: note("c1 f1").s("square").lpf(800).gain(.4)

$: n("2 0 2 3 4 2").scale("c:minor").s("sawtooth").lpf(1200).release(.2).gain(.4)
