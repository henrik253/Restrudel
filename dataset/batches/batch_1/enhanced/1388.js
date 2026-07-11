setcpm(96/4)

$: n("0 1 2 2 1 0 ~ ~").scale("d:hirajoshi").s("gm_overdriven_guitar:6").lpf(1200).release(.2).gain(.35).room(.4)

$: s("bd ~ [lt lt] ~ bd ~ lt ~").gain(.7)

$: n("-5 ~ ~ -5 ~ ~ -5 ~").scale("d:hirajoshi").s("square").lpf(450).release(.2).gain(.5)

$: s("hh*8").gain(.15)
