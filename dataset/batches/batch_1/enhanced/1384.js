setcpm(148/4)

$: s("breaks165").gain(.65)

$: s("perc*3 ~").gain(.25)

$: s("~ rim ~ rim").gain(.5)

$: note("e2 ~ e2 e2 ~ e2 ~ g2").s("supersaw").lpf(400).release(.15).gain(.35)

$: n("<7 ~ 9 12>").scale("e:minor").s("supersaw").lpf(1600).delay(.4).release(.2).gain(.25)
