setcpm(125/4)

$: s("mt lt lt mt*2").gain(.5)

$: s("~ hh ~ hh").gain(.2)

$: note("a2*8 a2*4 ~ ~ ~ a2*8").sound("square").lpf(2000).gain(.35)

$: s("~ sd ~ sd").gain(.4).lpf(3000)
