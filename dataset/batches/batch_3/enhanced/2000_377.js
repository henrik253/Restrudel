setcpm(100/4)

$: note("e1 ~ ~ e2 ~ e1 ~ ~").scale("c2:minor").sound("~ sd").lpf(4144).gain(.8349)

$: note("g2 a2 f2").scale("c2:minor").sound("sawtooth sawtooth").lpf(2000).lpq(.2).shape(.4).release(.1174).gain(0.4)

$: s("hh*8 Ethnic").slow(2).gain(0.5)

$: n("0 2 5 5 6 ~ 2 ~ 5").scale("c2:minor").struct("<x*4>").gain(0.6000000000000001)
