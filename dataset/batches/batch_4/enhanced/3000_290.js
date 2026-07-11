setcpm(35)

$: s("cowbell*4 ~").gain(.4)

$: n("0 2 4 0").scale("D:minor").s("sawtooth").lpf(800).gain(.4)

$: s("cymbal ~ ~ ~").clip(1).gain(.3)
