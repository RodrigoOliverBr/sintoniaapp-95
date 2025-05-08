
// Create a new user through admin API
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
};

// Handle the POST request
Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Create Supabase admin client using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Verify that the request is coming from an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized - Missing auth header', { 
        status: 401,
        headers: corsHeaders
      });
    }
    
    // Verify the token and check if user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
    
    if (verifyError || !user) {
      console.error("Authentication error:", verifyError);
      return new Response('Unauthorized - Invalid token', { 
        status: 401,
        headers: corsHeaders
      });
    }
    
    // Check if the user is an admin by checking the perfis table
    const { data: perfilData, error: perfilError } = await supabaseAdmin
      .from('perfis')
      .select('tipo')
      .eq('id', user.id)
      .single();
      
    if (perfilError || !perfilData || perfilData.tipo !== 'admin') {
      console.error("Not an admin user:", perfilError || "User is not an admin");
      return new Response('Forbidden - Not an admin', { 
        status: 403,
        headers: corsHeaders
      });
    }
    
    // Parse the request body
    const requestData = await req.json();
    const { email, password, clienteId, nome } = requestData;
    
    if (!email || !password || !clienteId) {
      return new Response('Bad Request - Missing required fields', { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    console.log(`Creating user for: ${email}, client ID: ${clienteId}`);
    
    // Create the user with Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        cliente_id: clienteId,
        nome,
        tipo: 'client'
      }
    });
    
    if (userError) {
      console.error("Error creating user:", userError);
      return new Response(JSON.stringify({ 
        error: `Error creating user: ${userError.message}` 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Now create the perfil entry
    const { data: perfilCreateData, error: perfilCreateError } = await supabaseAdmin
      .from('perfis')
      .insert([{
        id: userData.user.id,
        tipo: 'client',
        nome: nome,
        email: email
      }])
      .select();
      
    if (perfilCreateError) {
      console.error("Error creating perfil:", perfilCreateError);
      return new Response(JSON.stringify({ 
        warning: `User created but error creating perfil: ${perfilCreateError.message}`,
        user: userData.user 
      }), { 
        status: 207, // Partial success
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "User created successfully",
      user: userData.user,
      perfil: perfilCreateData[0]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: `Unexpected error: ${error.message}` }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
