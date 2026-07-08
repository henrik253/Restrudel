setcpm(105/4)

$: s("~ sd ~ sd").cutoff(1000).gain(.7)

$: s("hh*8").gain(.2)

$: n("-3 -1 -1 -4 -2").scale("C:minor").s("square").lpf(1500).gain(.35)

$: note("e3 c3@2 ~ g#3").sound("piano").lpf(2500).gain(.3)
