setcpm(100/4)

$: s("sd cp ~ ~").slow(2).gain(.8)

$: s("~ hh hh hh").gain("[.2 1@3]*2").hpf(4000)

$: note("c2 g2").s("sawtooth").lpf(700).gain(.4)

$: note("c4 eb4 g4 bb4").s("square").lpf(1500).room(.3).gain(.25)
