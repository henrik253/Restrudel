setcpm(30)

$: note("C1 F1 G1 C1").sound("bd*2 ~").lpf(1217).gain(.25)

$: n("1 4 2 1 3*2 E3").scale("a4:minor").s("cowbell ~").lpf(4642).room(.8).delay(.2).gain(.25)
