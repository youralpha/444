<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Sidebar from "./lib/Sidebar.svelte";
  import Base from "./routes/Base.svelte";
  import Dashboard from "./routes/Dashboard.svelte";
  import Kpt from "./routes/Kpt.svelte";
  import Knowledge from "./routes/Knowledge.svelte";

  export let url = "";
</script>

<Router {url}>
  <div class="flex min-h-screen bg-tactical-900 w-full overflow-hidden">
    <Sidebar />
    <main class="flex-1 relative h-screen overflow-y-auto custom-scrollbar">
      <Route path="/" component={Dashboard} />
      <Route path="/kpt" component={Kpt} />
      <Route path="/base" component={Base} />
      <Route path="/knowledge" component={Knowledge} />
    </main>
  </div>
</Router>
