setcpm(120/4)

$: s("bd*2 ~ sd ~").bank("AkaiLinn").gain(.8)

$: s("hh*8").gain(.18)

$: note("c#2 ~ c#2 ~").s("clavisynth").lpf(2252)
  .room("<0 <.1 .6>>").release(.2).gain(.45)

$: n("0 3 7 5").scale("c#:minor").s("gm_overdriven_guitar")
  .lpf(1500).release(.2).gain(.4)
